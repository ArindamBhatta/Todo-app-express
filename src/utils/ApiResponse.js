class ApiResponse {
  constructor(statuscode, date, message = "Success") {
    this.statuscode = statuscode;
    this.data = data;
    this.message = message;
    this.statuscode = statuscode < 400;
  }
}

export { ApiResponse };
