
import { Component, OnInit } from '@angular/core';
import { AdmCompanyInfoService } from '../../services/adm-company-info.service';

@Component({
  selector: 'app-adm-company-info-page',
  templateUrl: './adm-company-info-page.component.html'
})
export class AdmCompanyInfoPageComponent implements OnInit {
  rows: any[] = [];
  loading = false;

  constructor(private service: AdmCompanyInfoService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.service.getAll().subscribe({
      next: res => {
        this.rows = res;
        this.loading = false;
      },
      error: _ => this.loading = false
    });
  }
}
