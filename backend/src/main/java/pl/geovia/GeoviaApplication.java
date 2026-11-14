package pl.geovia.geovia;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "pl.geovia")
@EntityScan(basePackages = "pl.geovia.entity")
@EnableJpaRepositories(basePackages = "pl.geovia.repository")
public class GeoviaApplication {

	public static void main(String[] args) {
		SpringApplication.run(GeoviaApplication.class, args);
	}
}
