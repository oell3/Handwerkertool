import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { environment } from '@env/environment';

interface Vorlage {
  id: number;
  text: string;
  typ: string;
  name: string;
}

@Component({
  selector: 'app-create-user',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './create-user.html',
  styleUrls: ['./create-user.scss'],
})
export class CreateUserComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private readonly apiUrl = environment.apiUrl;

  registerForm: FormGroup = this.fb.group({
    name: [''],
    password: [''],
  });

  public vorlagen: Vorlage[] = [];

  ngOnInit() {
    this.vorlageSchluss();
  }

  public createUser(): void {
    this.http
      .post(`${this.apiUrl}/login`, this.registerForm.value, {
        observe: 'response',
        withCredentials: true,
      })
      .subscribe({
        next: (res) => {
          console.log('Status:', res.status);
          console.log('Body:', res.body);
        },

        error: (error) => {
          console.error(error);
        },
      });
  }

  public vorlageSchluss(): void {
    this.http
      .get<Vorlage[]>(`${this.apiUrl}/vorlage/einleitung`, {
        withCredentials: true,
      })
      .subscribe({
        next: (res) => {
          console.log(res);

          this.vorlagen = res;
        },

        error: (error) => {
          this.vorlagen = [];
          console.error(error);
        },
      });
  }
}
