import { HttpClient } from '@angular/common/http';
import { AfterViewInit,Component,inject, signal,ElementRef, ViewChild } from '@angular/core';
import TomSelect from 'tom-select';
import { QuillModule } from 'ngx-quill';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-dashboard',
  
  imports: [
    QuillModule,
    FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})

export class Dashboard {
  
}