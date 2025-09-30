package com.example.bff.vrac;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.time.Instant;
import java.util.List;
import java.util.Map;


/*
 * Class de test imaginée pour simuler une connection avec les TU unitaire cucumber (par exemple)
 */
public class OidcUserFactory {

    public static OidcUser createTestOidcUser() {
        // 🪪 1. Créer un ID Token fictif
        OidcIdToken idToken = new OidcIdToken(
                "fake-token-value",                // valeur du token
                Instant.now(),                     // date d’émission
                Instant.now().plusSeconds(3600),  // date d’expiration
                Map.of(
                        "sub", "user-uid-123",     // identifiant unique
                        "given_name", "Jean",      // prénom
                        "family_name", "Dupont",   // nom
                        "email", "jean.dupont@example.com"
                )
        );

        // 👤 2. Créer les claims du UserInfo (optionnel mais utile)
        OidcUserInfo userInfo = new OidcUserInfo(
                Map.of(
                        "sub", "user-uid-123",
                        "given_name", "Jean",
                        "family_name", "Dupont",
                        "email", "jean.dupont@example.com"
                )
        );

        // ✅ 3. Créer l’utilisateur OIDC simulé
        return new DefaultOidcUser(
                List.of(new SimpleGrantedAuthority("ROLE_USER")), // rôles
                idToken,
                userInfo,
                "sub" // champ utilisé comme "username" (identifiant principal)
        );
    }
}