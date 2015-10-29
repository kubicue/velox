class ShippingController < ApplicationController
  def home
    render :home
  end

  def create
      EasyPost.api_key = 'sFfFy3otb2g0hjzjWaqB6A'
      pa = params[:to_address]
      # binding.pry
      to_address = EasyPost::Address.create(
        :name => pa[:name],
        :street1 => pa[:street1],
        :city => pa[:city],
        :state => pa[:state],
        :zip => pa[:zip],
        :country => pa[:country],
        :phone => pa[:phone],
        )
      fa = params[:from_address]
      from_address = EasyPost::Address.create(
        :company => fa[:company],
        :street1 => fa[:street1],
        :city => fa[:city],
        :state => fa[:state],
        :zip => fa[:zip],
        :phone => fa[:phone],
        )
      parc = params[:parcel]
      parcel = EasyPost::Parcel.create(
        :width => parc[:width],
        :length => parc[:length],
        :height => parc[:height],
        :weight => parc[:weight],
        )

      customs_item = EasyPost::CustomsItem.create(
        :description => 'EasyPost T-shirts',
        :quantity => 2,
        :value => 23.56,
        :weight => 33,
        :origin_country => 'us',
        :hs_tariff_number => 123456
        )
      customs_info = EasyPost::CustomsInfo.create(
        :integrated_form_type => 'form_2976',
        :customs_certify => true,
        :customs_signer => 'Dr. Pepper',
        :contents_type => 'gift',
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

      # binding.pry
      puts shipment.postage_label.label_url

      redirect_to shipment.postage_label.label_url
    # render :index
  end
end
