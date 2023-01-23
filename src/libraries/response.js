

export class Response {
  static success(res, data, extra = undefined, status = 200) {
    return Response.resp(res, true, data, status, extra)
  }

  static error (res, data, extra = undefined, status = 406) {
    return Response.resp(res, false, data, status, extra)
  }

  static resp (res, succ, data, status, extra = undefined) {
    if (data === undefined) {
      return res.status(status).json( {"Success": succ, ...extra} )
    }
    else {
      return res.status(status).json( {"Success": succ, ...extra, "Data": data} )
    }
  }
}
