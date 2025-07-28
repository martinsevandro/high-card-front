import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  searchForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      riotName: ['', Validators.required],
      riotTag: ['', Validators.required],
      riotServer: ['br1', Validators.required],
      matchId: [''],

    });
  }

  onSubmit() {
    if (this.searchForm.valid){
      const formValues = this.searchForm.value;
      console.log('Form Values enviado:', formValues);
    }
  }

  onSaveImage() {
    console.log('Salvar imagem');
  }

}
