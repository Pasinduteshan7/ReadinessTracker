package com.example.readinesstrackerbackend.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class EncryptionUtil {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12; // 96 bits recommended for AES-GCM
    private static final int GCM_TAG_LENGTH = 128; // in bits
    private static final String PREFIX = "enc:v1:";

    private final SecretKey secretKey;
    private final SecureRandom secureRandom;

    public EncryptionUtil(@Value("${app.encryption.secret:readiness-tracker-aes256-master-secret-key-2024!}") String secret) {
        this.secretKey = deriveKey(secret);
        this.secureRandom = new SecureRandom();
    }

    private SecretKey deriveKey(String secret) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = digest.digest(secret.getBytes(StandardCharsets.UTF_8));
            return new SecretKeySpec(keyBytes, "AES");
        } catch (Exception e) {
            throw new IllegalStateException("Failed to derive AES-256 key from secret", e);
        }
    }

    /**
     * Encrypts plaintext string using AES-256-GCM with a fresh random IV.
     * Output format: "enc:v1:" + Base64(IV [12 bytes] + Ciphertext + Tag)
     */
    public String encrypt(String plaintext) {
        if (plaintext == null || plaintext.isBlank()) {
            return null;
        }

        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + ciphertext.length);
            byteBuffer.put(iv);
            byteBuffer.put(ciphertext);

            String encoded = Base64.getEncoder().encodeToString(byteBuffer.array());
            return PREFIX + encoded;
        } catch (Exception e) {
            throw new RuntimeException("Failed to encrypt token: " + e.getMessage(), e);
        }
    }

    /**
     * Decrypts ciphertext string using AES-256-GCM.
     */
    public String decrypt(String encryptedText) {
        if (encryptedText == null || encryptedText.isBlank()) {
            return null;
        }

        if (!encryptedText.startsWith(PREFIX)) {
            // Backward compatibility: If an unencrypted legacy token was previously stored
            return encryptedText;
        }

        try {
            String rawBase64 = encryptedText.substring(PREFIX.length());
            byte[] decoded = Base64.getDecoder().decode(rawBase64);

            if (decoded.length < GCM_IV_LENGTH) {
                throw new IllegalArgumentException("Invalid encrypted payload length");
            }

            ByteBuffer byteBuffer = ByteBuffer.wrap(decoded);
            byte[] iv = new byte[GCM_IV_LENGTH];
            byteBuffer.get(iv);

            byte[] cipherBytes = new byte[byteBuffer.remaining()];
            byteBuffer.get(cipherBytes);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

            byte[] plainBytes = cipher.doFinal(cipherBytes);
            return new String(plainBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Failed to decrypt token: " + e.getMessage(), e);
        }
    }

    /**
     * Masks token for safe display (e.g. ghp_****1234)
     */
    public String maskToken(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        String clean = token.trim();
        if (clean.length() <= 8) {
            return "****";
        }
        String prefix = clean.substring(0, Math.min(4, clean.length()));
        String suffix = clean.substring(clean.length() - 4);
        return prefix + "****" + suffix;
    }
}
