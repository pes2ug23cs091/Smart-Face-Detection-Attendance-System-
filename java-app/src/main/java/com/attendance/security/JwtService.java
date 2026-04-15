package com.attendance.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-minutes}")
    private int expirationMinutes;

    public String generateToken(String subject, String role, String userId) {
        long now = System.currentTimeMillis();
        long exp = now + (expirationMinutes * 60L * 1000L);

        return Jwts.builder()
                .setSubject(subject)
                .addClaims(Map.of("role", role, "userId", userId))
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(exp))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    private Key getSigningKey() {
        try {
            byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            byte[] raw = jwtSecret.getBytes();
            byte[] padded = new byte[32];
            for (int i = 0; i < padded.length; i++) {
                padded[i] = raw[i % raw.length];
            }
            return Keys.hmacShaKeyFor(padded);
        }
    }
}
