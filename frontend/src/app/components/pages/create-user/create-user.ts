import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';

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
      .post('http://localhost:8080/login', this.registerForm.value, {
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
      .get<Vorlage[]>('http://localhost:8080/api/vorlage/einleitung', {
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
