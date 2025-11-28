package customer.employeeleavemanagement.config;

import java.io.IOException;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;



@Configuration
public class CorsConfig{
@Bean
    public FilterRegistrationBean<Filter> corsFilter() {

        FilterRegistrationBean<Filter> registrationBean = new FilterRegistrationBean<>();

        registrationBean.setFilter(new Filter() {

            @Override
            public void init(FilterConfig filterConfig) throws ServletException {
                //No Modification
            }

            @Override
            public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
                    throws IOException, ServletException {

                HttpServletRequest request = (HttpServletRequest) req;
                HttpServletResponse response = (HttpServletResponse) res;

                // CORS headers
                response.setHeader("Access-Control-Allow-Origin", "http://localhost:8081");
                //response.setHeader("Access-Control-Allow-Credentials", "true");
                response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
                response.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept ");
                response.setHeader("Access-Control-Max-Age", "3600");

                // Handle preflight OPTIONS request
                if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                    response.setStatus(HttpServletResponse.SC_OK);
                    return;  // Do not continue to CAP OData servlet
                }

                // Continue filter chain for real requests
                chain.doFilter(req, res);
            }

            @Override
            public void destroy() {
                // Optional: cleanup code
            }
        });

        // Apply filter to all endpoints
        registrationBean.addUrlPatterns("/*");

        // Ensure this filter runs before all others
        registrationBean.setOrder(Integer.MIN_VALUE);

        return registrationBean;
    }

}


