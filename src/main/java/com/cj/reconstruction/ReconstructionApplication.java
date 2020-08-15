package com.cj.reconstruction;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

/**
 * @author Nightessss 2020/5/9 20:27
 */
@SpringBootApplication
@EnableSwagger2
public class ReconstructionApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReconstructionApplication.class, args);
    }
}
