class ShippingController < ApplicationController
  def home
    wf = 'https://api.forecast.io/forecast/8b0e1f8b53a5e7e0e6b2a1b2ced3ceda/32.7150,-117.1625'
    @weather = HTTParty.get(wf).parsed_response
    @city = "Santa Monica, CA"
  end


  def create

      #Easypost Shipping API Integration
      EasyPost.api_key = 'sFfFy3otb2g0hjzjWaqB6A'
      #Capture sender adress information
      sender = params[:to_address]

      to_address = EasyPost::Address.create(
        :name => sender[:name],
        :street1 => sender[:street1],
        :city => sender[:city],
        :state => sender[:state],
        :zip => sender[:zip],
        :country => sender[:country],
        :phone => sender[:phone],
        )
        #Capture recipient adress information
        recipient = params[:from_address]
      from_address = EasyPost::Address.create(
        :company => recipient[:company],
        :street1 => recipient[:street1],
        :city => recipient[:city],
        :state => recipient[:state],
        :zip => recipient[:zip],
        :phone => recipient[:phone],
        )
      #Capture parcel details information
      pack = params[:parcel]
      parcel = EasyPost::Parcel.create(
        :width => pack[:width],
        :length => pack[:length],
        :height => pack[:height],
        :weight => pack[:weight],
        )

      customs_item = EasyPost::CustomsItem.create(
        :description => '',
        :quantity => 1,
        :value => 1,
        :weight => 3,
        :origin_country => 'US',
        :hs_tariff_number => 12345,
        )

      customs_info = EasyPost::CustomsInfo.create(
        :integrated_form_type => 'form_2976',
        :customs_certify => true,
        :customs_signer => '',
        :contents_type => '',
    :contents_explanation => '', # only required when contents_type => 'other'
    :eel_pfc => 'NOEEI 30.37(a)',
    :non_delivery_option => 'abandon',
    :restriction_type => 'none',
    :restriction_comments => '',
    :customs_items => [customs_item]
    )

      shipment = EasyPost::Shipment.create(
        :to_address => to_address,
        :from_address => from_address,
        :parcel => parcel,
        :customs_info => customs_info
        )

      shipment.buy(
        :rate => shipment.lowest_rate
        )


      puts shipment.postage_label.label_url

      redirect_to shipment.postage_label.label_url

  end
end
