import { Injectable } from '@angular/core';
import { BaseRequestService } from './base-request.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserInfo } from '../models/models';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FormService extends BaseRequestService {
  constructor(public _snackBar: MatSnackBar, public http: HttpClient) {
    super(_snackBar, http);
  }

  async create(data, images) {
    const serverResp: any = await this.post('/form/create', data);

    const resp: any = await this.http
      .post('http://127.0.0.1:7000/form/upload-img/' + serverResp.id, images)
      .toPromise();
  }
  async update(data, images) {
    let resp: any = await this.post('/form/update', data);

    resp = await this.http
      .post('http://127.0.0.1:7000/form/upload-img/' + data.id, images)
      .toPromise();
    if (resp.data.succes)
      this._snackBar.open('Data update successfully!', null, {
        duration: 2000,
        verticalPosition: 'top',
      });
  }
  async getById(id) {
    const resp: any = await this.get('/form/get-by-id', { 'form-id': id });
    return resp;
  }
}
