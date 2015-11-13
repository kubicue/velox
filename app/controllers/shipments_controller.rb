class ShipmentsController < ApplicationController
  before_filter :authorize

  #Easypost Shipping API Integration
  EasyPost.api_key = 'sFfFy3otb2g0hjzjWaqB6A'
 #Capture sender adress information

  def create

    from_address = EasyPost::Address.create(
      name:    params[:from_name],
      street1: params[:from_street1],
      city:    params[:from_city],
      state:   params[:from_state],
      zip:     params[:from_zip],
      country: params[:from_country],
      email:   params[:from_email]
    )

    to_address = EasyPost::Address.create(
      name:    params[:to_name],
      street1: params[:to_street1],
      city:    params[:to_city],
      state:   params[:to_state],
      zip:     params[:to_zip],
      country: params[:to_country],
      email:   params[:email],
    )

    parcel = EasyPost::Parcel.create(
      length: params[:length],
      width: params[:width],
      height: params[:height],
      weight: params[:weight],
    )

    shipment = EasyPost::Shipment.create(
      to_address: to_address,
      from_address: from_address,
      parcel: parcel
    )

    @rates = shipment['rates']
    shipment.buy(:rate => easypost_rate_for_shipping_method(shipment))
shipment.label(:file_format => 'zpl')
update_attribute(:label_needs_printing, true)


  end
end
