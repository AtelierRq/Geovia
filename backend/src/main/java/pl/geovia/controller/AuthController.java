package pl.geovia.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;
import pl.geovia.dto.*;
import pl.geovia.service.AccountService;
import java.util.UUID;
import java.util.List;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final AccountService service;
    @Value("${app.auth.cookie-secure:false}") private boolean secureCookie;
    public AuthController(AccountService service) { this.service=service; }

    @PostMapping("/register") @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    public void register(@Valid @RequestBody RegisterRequest request) { service.register(request); }

    @PostMapping("/login")
    public AccountResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest, HttpServletResponse response) {
        String token=service.login(request, servletRequest.getHeader("User-Agent"));
        response.addHeader(HttpHeaders.SET_COOKIE, cookie(token, 12*60*60).toString());
        UUID id=service.resolveSession(token);
        return service.getAccount(id);
    }

    @GetMapping("/me")
    public AccountResponse me(@RequestAttribute("accountId") UUID accountId) { return service.getAccount(accountId); }

    @PostMapping("/logout") @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void logout(@CookieValue(name="geovia_session", required=false) String token, HttpServletResponse response) {
        service.logout(token); response.addHeader(HttpHeaders.SET_COOKIE, cookie("", 0).toString());
    }

    @PostMapping("/verify-email") @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void verify(@Valid @RequestBody TokenRequest request) { service.verifyEmail(request.token()); }

    @PostMapping("/resend-verification") @ResponseStatus(org.springframework.http.HttpStatus.ACCEPTED)
    public MessageResponse resendVerification(@Valid @RequestBody EmailRequest request) {
        service.resendVerification(request);
        return new MessageResponse("Jeśli konto wymaga weryfikacji, wysłaliśmy wiadomość z linkiem.");
    }

    @PostMapping("/password/forgot") @ResponseStatus(org.springframework.http.HttpStatus.ACCEPTED)
    public MessageResponse requestPasswordReset(@Valid @RequestBody EmailRequest request) {
        service.requestPasswordReset(request);
        return new MessageResponse("Jeśli konto istnieje i ma potwierdzony adres, wysłaliśmy link do resetu hasła.");
    }

    @PostMapping("/password/reset") @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) { service.resetPassword(request); }

    @GetMapping("/sessions")
    public List<AccountSessionResponse> sessions(@RequestAttribute("accountId") UUID accountId,
                                                 @CookieValue(name="geovia_session", required=false) String token) {
        return service.getSessions(accountId, token);
    }

    @DeleteMapping("/sessions/{sessionId}") @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void revokeSession(@RequestAttribute("accountId") UUID accountId, @PathVariable UUID sessionId,
                              @CookieValue(name="geovia_session", required=false) String token,
                              HttpServletResponse response) {
        if (service.revokeSession(accountId, sessionId, token)) response.addHeader(HttpHeaders.SET_COOKIE, cookie("", 0).toString());
    }

    @DeleteMapping("/account") @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void deleteAccount(@RequestAttribute("accountId") UUID accountId, @Valid @RequestBody DeleteAccountRequest request,
                              HttpServletResponse response) {
        service.deleteAccount(accountId, request);
        response.addHeader(HttpHeaders.SET_COOKIE, cookie("", 0).toString());
    }

    @PostMapping("/email") @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void changeEmail(@RequestAttribute("accountId") UUID accountId, @Valid @RequestBody ChangeEmailRequest request) { service.requestEmailChange(accountId, request); }

    @PostMapping("/password") @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void changePassword(@RequestAttribute("accountId") UUID accountId,
                               @CookieValue(name="geovia_session") String sessionToken,
                               @Valid @RequestBody ChangePasswordRequest request) {
        service.changePassword(accountId, sessionToken, request);
    }

    private ResponseCookie cookie(String value, long maxAge) {
        return ResponseCookie.from("geovia_session", value).httpOnly(true).secure(secureCookie).sameSite("Lax").path("/api").maxAge(maxAge).build();
    }
    public record TokenRequest(@jakarta.validation.constraints.NotBlank String token) {}
    public record MessageResponse(String message) {}
}
