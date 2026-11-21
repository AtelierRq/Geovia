package pl.geovia.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.*;
import pl.geovia.service.AccountService;
import java.util.UUID;

@Component
public class AuthSessionInterceptor implements HandlerInterceptor, WebMvcConfigurer {
    private final AccountService accounts;
    public AuthSessionInterceptor(AccountService accounts) { this.accounts=accounts; }
    @Override public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(this).addPathPatterns("/api/profiles/**", "/api/attempts/**", "/api/daily-challenges/**", "/api/auth/me", "/api/auth/email", "/api/auth/password", "/api/auth/sessions", "/api/auth/sessions/**", "/api/auth/account")
                .excludePathPatterns("/api/daily-challenges/today");
    }
    @Override public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String token=null;
        if (request.getCookies()!=null) for (var cookie: request.getCookies()) if ("geovia_session".equals(cookie.getName())) { token=cookie.getValue(); break; }
        UUID accountId=accounts.resolveSession(token);
        if (accountId==null) { response.setStatus(401); return false; }
        request.setAttribute("accountId", accountId);
        return true;
    }
}
