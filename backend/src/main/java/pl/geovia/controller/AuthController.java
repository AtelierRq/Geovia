package pl.geovia.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;
import pl.geovia.dto.*;
import pl.geovia.service.AccountService;
import java.util.UUID;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final AccountService service;
    @Value("${app.auth.cookie-secure:false}") private boolean secureCookie;
    public AuthController(AccountService service) { this.service=service; }

    @PostMapping("/register") @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    public void register(@Valid @RequestBody RegisterRequest request) { service.register(request); }

    @PostMapping("/login")
    public AccountResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        String token=service.login(request);
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
    public void verify(@RequestBody TokenRequest request) { service.verifyEmail(request.token()); }

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
}
