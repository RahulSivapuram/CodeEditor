export class CodeExecutionRequest {
  language_id!: number;
  source_code!: string;
  stdin!: string;
  constructor(language_id: number, source_code: string, stdin: string) {
    this.language_id = language_id;
    this.source_code = source_code;
    this.stdin = stdin;
  }
}
