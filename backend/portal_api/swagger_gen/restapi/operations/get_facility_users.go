// Code generated by go-swagger; DO NOT EDIT.

package operations

// This file was generated by the swagger tool.
// Editing this file might prove futile when you re-run the generate command

import (
	"net/http"

	"github.com/go-openapi/runtime/middleware"

	"github.com/divoc/portal-api/swagger_gen/models"
)

// GetFacilityUsersHandlerFunc turns a function with the right signature into a get facility users handler
type GetFacilityUsersHandlerFunc func(GetFacilityUsersParams, *models.JWTClaimBody) middleware.Responder

// Handle executing the request and returning a response
func (fn GetFacilityUsersHandlerFunc) Handle(params GetFacilityUsersParams, principal *models.JWTClaimBody) middleware.Responder {
	return fn(params, principal)
}

// GetFacilityUsersHandler interface for that can handle valid get facility users params
type GetFacilityUsersHandler interface {
	Handle(GetFacilityUsersParams, *models.JWTClaimBody) middleware.Responder
}

// NewGetFacilityUsers creates a new http.Handler for the get facility users operation
func NewGetFacilityUsers(ctx *middleware.Context, handler GetFacilityUsersHandler) *GetFacilityUsers {
	return &GetFacilityUsers{Context: ctx, Handler: handler}
}

/* GetFacilityUsers swagger:route GET /facility/users getFacilityUsers

Get users of a facility

*/
type GetFacilityUsers struct {
	Context *middleware.Context
	Handler GetFacilityUsersHandler
}

func (o *GetFacilityUsers) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	route, rCtx, _ := o.Context.RouteInfo(r)
	if rCtx != nil {
		r = rCtx
	}
	var Params = NewGetFacilityUsersParams()
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
