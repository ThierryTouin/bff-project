import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styles: [`
        .login-container { max-width: 400px; margin: 40px auto; font-family: Arial, sans-serif; }
        label { display: block; margin-bottom: 8px; }
        input[type="email"], input[type="password"] { width: 100%; padding: 8px; box-sizing: border-box; margin-top: 4px; }
        .remember { margin: 12px 0; font-size: 14px; }
        .actions { margin-top: 12px; }
        button { padding: 8px 16px; }
        .error { color: #b00020; font-size: 13px; margin-top: 6px; }
    `]
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    loading = false;
    error: string | null = null;

    constructor(private fb: FormBuilder, private router: Router) {}

    ngOnInit(): void {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            remember: [false]
        });
    }

    get email() { return this.loginForm.get('email')!; }
    get password() { return this.loginForm.get('password')!; }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        this.error = null;

        const { email, password, remember } = this.loginForm.value;

        // TODO: remplacer par appel réel au service d'authentification
        this.fakeLogin(email, password, remember)
            .then(() => {
                this.loading = false;
                // rediriger après succès
                this.router.navigate(['/']);
            })
            .catch((err: any) => {
                this.loading = false;
                this.error = err?.message ?? 'Échec de la connexion';
            });
    }

    private fakeLogin(email: string, password: string, remember: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            // simulation asynchrone
            setTimeout(() => {
                if (email === 'user@example.com' && password === 'password') {
                    resolve();
                } else {
                    reject({ message: 'Email ou mot de passe incorrect.' });
                }
            }, 800);
        });
    }
}