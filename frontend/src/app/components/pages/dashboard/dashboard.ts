import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  ElementRef,
  ViewChild,
} from '@angular/core';
import TomSelect from 'tom-select';
import { QuillModule } from 'ngx-quill';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  imports: [QuillModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {}
