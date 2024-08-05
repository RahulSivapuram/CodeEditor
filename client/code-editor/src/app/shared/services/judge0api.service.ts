import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CodeExecutionRequest } from '../../utils/models/codeexecutionrequest';

@Injectable({
  providedIn: 'root',
})
export class Judge0apiService {
  programmingLanguages = [
    {
      id: 93,
      label: 'Javascript',
      name: 'javascript',
    },
    {
      label: 'Python 3',
      id: 71,
      name: 'python',
    },
    {
      label: 'Java',
      id: 91,
      name: 'java',
    },
    {
      label: 'C++',
      id: 54,
      name: 'cpp',
    },
  ];
  constructor(private http: HttpClient) {}

  runCode(data: CodeExecutionRequest) {
    let Headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('x-rapidapi-host', 'judge0-ce.p.rapidapi.com')
      .set(
        'x-rapidapi-key',
        'aba4ac04a8mshc84dd1b9336836ap10fd7fjsn77535e969c4f'
      );
    let Params = new HttpParams()
      .set('base64_encoded', 'true')
      .set('fields', '*');
    return this.http.post(
      'https://judge0-ce.p.rapidapi.com/submissions/',
      data,
      {
        headers: Headers,
        params: Params,
      }
    );
  }

  getResult(res: any) {
    let Headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('x-rapidapi-host', 'judge0-ce.p.rapidapi.com')
      .set(
        'x-rapidapi-key',
        'aba4ac04a8mshc84dd1b9336836ap10fd7fjsn77535e969c4f'
      );
    let Params = new HttpParams().set('base64_encoded', 'true');
    return this.http.get(
      `https://judge0-ce.p.rapidapi.com/submissions/${res}`,
      { headers: Headers, params: Params }
    );
  }
}
