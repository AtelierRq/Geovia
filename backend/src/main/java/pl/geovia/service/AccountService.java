package pl.geovia.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import pl.geovia.dto.*;
import pl.geovia.entity.*;
import pl.geovia.repository.*;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class AccountService {
    private static final int ITERATIONS = 310_000;
    private static final int SESSION_HOURS = 12;
    private final AccountRepository accounts;
    private final AccountSessionRepository sessions;
    private final EmailVerificationTokenRepository verificationTokens;
    private final PasswordResetTokenRepository resetTokens;
    private final ProfileRepository profiles;
    private final JavaMailSender mailSender;
    private final SecureRandom random = new SecureRandom();
    @Value("${app.auth.base-url:http://localhost:5173}") private String baseUrl;
    @Value("${app.mail.from:no-reply@geovia.local}") private String mailFrom;

    public AccountService(AccountRepository accounts, AccountSessionRepository sessions,
                          EmailVerificationTokenRepository verificationTokens, PasswordResetTokenRepository resetTokens,
                          ProfileRepository profiles,
                          JavaMailSender mailSender) {
        this.accounts=accounts; this.sessions=sessions; this.verificationTokens=verificationTokens;
        this.resetTokens=resetTokens; this.profiles=profiles; this.mailSender=mailSender;
    }

    public void register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (accounts.existsByEmailIgnoreCase(email)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        String username = request.username().trim();
        if (profiles.existsByUsernameIgnoreCase(username)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken");
        Account account = accounts.save(new Account(UUID.randomUUID(), email, hashPassword(request.password())));
        Profile profile = new Profile(UUID.randomUUID(), username, null, null, null);
        profile.setAccount(account);
        profiles.save(profile);
        sendVerificationMessage(account, email, "Potwierdź adres e-mail w Geovii", "Aby potwierdzić adres");
    }

    public String login(LoginRequest request, String userAgent) {
        Account account = accounts.findByEmailIgnoreCase(normalizeEmail(request.email()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Nieprawidłowy e-mail lub hasło"));
        if (!verifyPassword(request.password(), account.getPasswordHash())) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Nieprawidłowy e-mail lub hasło");
        if (account.getEmailVerifiedAt() == null) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Potwierdź adres e-mail przed zalogowaniem");
        String token = randomToken();
        sessions.deleteExpired();
        String normalizedAgent = userAgent == null ? null : userAgent.substring(0, Math.min(userAgent.length(), 512));
        sessions.saveAndFlush(new AccountSession(UUID.randomUUID(), account.getId(), sha256(token), OffsetDateTime.now().plusHours(SESSION_HOURS), normalizedAgent));
        return token;
    }

    public void verifyEmail(String token) {
        EmailVerificationToken saved = verificationTokens.findByTokenHash(sha256(token))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Link weryfikacyjny jest nieprawidłowy lub wygasł"));
        if (saved.getExpiresAt().isBefore(OffsetDateTime.now())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Link weryfikacyjny jest nieprawidłowy lub wygasł");
        if (verificationTokens.consumeByTokenHash(sha256(token)) != 1)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Link weryfikacyjny został już użyty lub wygasł");
        Account account = accounts.findById(saved.getAccountId()).orElseThrow();
        if (account.getPendingEmail() != null) {
            if (accounts.findByEmailIgnoreCase(account.getPendingEmail()).filter(other -> !other.getId().equals(account.getId())).isPresent())
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
            account.setEmail(account.getPendingEmail()); account.setPendingEmail(null);
        }
        account.setEmailVerifiedAt(OffsetDateTime.now());
        accounts.save(account);
    }

    public void requestEmailChange(UUID accountId, ChangeEmailRequest request) {
        Account account = requireAccount(accountId);
        String email = normalizeEmail(request.email());
        if (email.equalsIgnoreCase(account.getEmail())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Podany adres jest już używany");
        if (accounts.existsByEmailIgnoreCase(email)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        account.setPendingEmail(email);
        sendVerificationMessage(account, email, "Potwierdź nowy adres e-mail w Geovii", "Aby zmienić adres e-mail");
    }

    public void changePassword(UUID accountId, String sessionToken, ChangePasswordRequest request) {
        Account account = requireAccount(accountId);
        if (!verifyPassword(request.currentPassword(), account.getPasswordHash())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Obecne hasło jest nieprawidłowe");
        account.setPasswordHash(hashPassword(request.newPassword())); accounts.save(account);
        sessions.deleteOtherSessions(accountId, sha256(sessionToken));
    }

    public void resendVerification(EmailRequest request) {
        Account account = accounts.findByEmailIgnoreCase(normalizeEmail(request.email())).orElse(null);
        if (account == null) return;
        String target = account.getPendingEmail();
        if (target == null && account.getEmailVerifiedAt() == null) target = account.getEmail();
        if (target != null) sendVerificationMessage(account, target, "Potwierdź adres e-mail w Geovii", "Aby potwierdzić adres");
    }

    public void requestPasswordReset(EmailRequest request) {
        Account account = accounts.findByEmailIgnoreCase(normalizeEmail(request.email())).orElse(null);
        if (account == null || account.getEmailVerifiedAt() == null) return;
        resetTokens.deleteAllByAccountId(account.getId());
        String token = randomToken();
        resetTokens.save(new PasswordResetToken(UUID.randomUUID(), account.getId(), sha256(token), OffsetDateTime.now().plusHours(1)));
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom); message.setTo(account.getEmail()); message.setSubject("Reset hasła do Geovii");
        message.setText("Aby ustawić nowe hasło, otwórz: " + baseUrl + "/reset-password?token=" + token + "\nLink jest ważny przez godzinę.");
        sendMail(message, "Nie udało się wysłać wiadomości resetującej hasło. Sprawdź konfigurację SMTP.");
    }

    public void resetPassword(ResetPasswordRequest request) {
        String tokenHash = sha256(request.token());
        PasswordResetToken saved = resetTokens.findByTokenHash(tokenHash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Link resetujący jest nieprawidłowy lub wygasł"));
        if (saved.getExpiresAt().isBefore(OffsetDateTime.now())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Link resetujący jest nieprawidłowy lub wygasł");
        if (resetTokens.consumeByTokenHash(tokenHash) != 1) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Link resetujący został już użyty lub wygasł");
        Account account = accounts.findById(saved.getAccountId()).orElseThrow();
        account.setPasswordHash(hashPassword(request.newPassword()));
        accounts.save(account);
        sessions.deleteAllForAccount(account.getId());
        resetTokens.deleteAllByAccountId(account.getId());
    }

    @Transactional(readOnly = true)
    public List<AccountSessionResponse> getSessions(UUID accountId, String currentToken) {
        String currentHash = currentToken == null ? "" : sha256(currentToken);
        return sessions.findAllByAccountIdAndExpiresAtAfterOrderByCreatedAtDesc(accountId, OffsetDateTime.now()).stream()
                .map(session -> new AccountSessionResponse(session.getId(), session.getCreatedAt(), session.getExpiresAt(),
                        session.getUserAgent(), session.getTokenHash().equals(currentHash)))
                .toList();
    }

    public boolean revokeSession(UUID accountId, UUID sessionId, String currentToken) {
        AccountSession session = sessions.findByIdAndAccountId(sessionId, accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sesja nie istnieje"));
        boolean current = currentToken != null && session.getTokenHash().equals(sha256(currentToken));
        sessions.deleteOwnedSession(sessionId, accountId);
        return current;
    }

    public void deleteAccount(UUID accountId, DeleteAccountRequest request) {
        Account account = requireAccount(accountId);
        if (!account.getEmail().equalsIgnoreCase(normalizeEmail(request.email())) || !verifyPassword(request.password(), account.getPasswordHash()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Podany e-mail lub hasło są nieprawidłowe");
        accounts.delete(account);
    }

    @Transactional(readOnly = true) public AccountResponse getAccount(UUID id) { return toResponse(requireAccount(id)); }
    @Transactional(readOnly = true) public Account requireAccount(UUID id) {
        return accounts.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required"));
    }
    @Transactional(readOnly = true) public UUID resolveSession(String token) {
        if (token == null || token.isBlank()) return null;
        return sessions.findActiveAccountId(sha256(token)).orElse(null);
    }
    public void logout(String token) { if (token != null && !token.isBlank()) sessions.deleteByTokenHash(sha256(token)); }

    private AccountResponse toResponse(Account account) {
        Profile p = profiles.findByAccount_Id(account.getId()).orElseThrow();
        return new AccountResponse(account.getId(), account.getEmail(), account.getEmailVerifiedAt()!=null,
                p.getId(), p.getUsername(), p.getAvatarUrl(), p.getBio(), p.getCity());
    }
    private void sendVerificationMessage(Account account, String targetEmail, String subject, String action) {
        verificationTokens.deleteAllByAccountId(account.getId());
        String token = randomToken();
        verificationTokens.save(new EmailVerificationToken(UUID.randomUUID(), account.getId(), sha256(token), OffsetDateTime.now().plusHours(24)));
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom); message.setTo(targetEmail); message.setSubject(subject);
        message.setText(action + ", otwórz: " + baseUrl + "/verify-email?token=" + token + "\nLink jest ważny przez 24 godziny.");
        sendMail(message, "Nie udało się wysłać wiadomości weryfikacyjnej. Skonfiguruj SMTP i spróbuj ponownie.");
    }
    private void sendMail(SimpleMailMessage message, String reason) {
        try { mailSender.send(message); }
        catch (MailException exception) { throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, reason); }
    }
    private static String normalizeEmail(String email) { return email.trim().toLowerCase(java.util.Locale.ROOT); }
    private String randomToken() { byte[] bytes = new byte[32]; random.nextBytes(bytes); return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes); }
    private static String sha256(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception e) { throw new IllegalStateException(e); }
    }
    private String hashPassword(String password) {
        byte[] salt = new byte[16]; random.nextBytes(salt);
        PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, ITERATIONS, 256);
        try { byte[] hash = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
            return "pbkdf2$"+ITERATIONS+"$"+Base64.getEncoder().encodeToString(salt)+"$"+Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) { throw new IllegalStateException(e); } finally { spec.clearPassword(); }
    }
    private static boolean verifyPassword(String password, String encoded) {
        try {
            String[] pieces=encoded.split("\\$"); if(pieces.length!=4 || !pieces[0].equals("pbkdf2")) return false;
            byte[] salt=Base64.getDecoder().decode(pieces[2]); byte[] expected=Base64.getDecoder().decode(pieces[3]);
            PBEKeySpec spec=new PBEKeySpec(password.toCharArray(),salt,Integer.parseInt(pieces[1]),expected.length*8);
            try { return MessageDigest.isEqual(expected,SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded()); }
            finally { spec.clearPassword(); }
        } catch (Exception e) { return false; }
    }
}
