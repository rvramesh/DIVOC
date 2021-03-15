// Code generated by go-swagger; DO NOT EDIT.

package operations

// This file was generated by the swagger tool.
// Editing this file might prove futile when you re-run the generate command

import (
	"net/http"

	"github.com/go-openapi/runtime/middleware"

	"github.com/divoc/portal-api/swagger_gen/models"
)

// GetEnrollmentsUploadsErrorsHandlerFunc turns a function with the right signature into a get enrollments uploads errors handler
type GetEnrollmentsUploadsErrorsHandlerFunc func(GetEnrollmentsUploadsErrorsParams, *models.JWTClaimBody) middleware.Responder

// Handle executing the request and returning a response
func (fn GetEnrollmentsUploadsErrorsHandlerFunc) Handle(params GetEnrollmentsUploadsErrorsParams, principal *models.JWTClaimBody) middleware.Responder {
	return fn(params, principal)
}

// GetEnrollmentsUploadsErrorsHandler interface for that can handle valid get enrollments uploads errors params
type GetEnrollmentsUploadsErrorsHandler interface {
	Handle(GetEnrollmentsUploadsErrorsParams, *models.JWTClaimBody) middleware.Responder
}

// NewGetEnrollmentsUploadsErrors creates a new http.Handler for the get enrollments uploads errors operation
func NewGetEnrollmentsUploadsErrors(ctx *middleware.Context, handler GetEnrollmentsUploadsErrorsHandler) *GetEnrollmentsUploadsErrors {
	return &GetEnrollmentsUploadsErrors{Context: ctx, Handler: handler}
}

/* GetEnrollmentsUploadsErrors swagger:route GET /enrollments/uploads/{uploadId}/errors getEnrollmentsUploadsErrors

Get all the error rows associated with given uploadId

*/
type GetEnrollmentsUploadsErrors struct {
	Context *middleware.Context
	Handler GetEnrollmentsUploadsErrorsHandler
}

func (o *GetEnrollmentsUploadsErrors) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	route, rCtx, _ := o.Context.RouteInfo(r)
	if rCtx != nil {
		r = rCtx
	}
	var Params = NewGetEnrollmentsUploadsErrorsParams()
	uprinc, aCtx, err := o.Context.Authorize(r, route)
	if err != nil {
		o.Context.Respond(rw, r, route.Produces, route, err)
		return
	}
	if aCtx != nil {
		r = aCtx
	}
	var principal *models.JWTClaimBody
	if uprinc != nil {
		principal = uprinc.(*models.JWTClaimBody) // this is really a models.JWTClaimBody, I promise
	}

	if err := o.Context.BindValidRequest(r, route, &Params); err != nil { // bind params
		o.Context.Respond(rw, r, route.Produces, route, err)
		return
	}

	res := o.Handler.Handle(Params, principal) // actually handle the request
	o.Context.Respond(rw, r, route.Produces, route, res)

}
