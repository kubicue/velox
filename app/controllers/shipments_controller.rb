class ShipmentsController < ApplicationController
  before_filter :authorize
  def index
    @shipments = Shipment.all
  end
  def new
    @shipments = Shipment.new
  end
  def create
 require 'easypost'
 EasyPost.api_key = 'sFfFy3otb2g0hjzjWaqB6A'

 to_address = EasyPost::Address.create(
   :name => params[:tname],
   :street1 => params[:tstreet1],
   :street2 => params[:tstreet2],
   :city => params[:tcity],
   :state => params[:tstate],
   :zip => params[:tzip],
   :country => params[:tcountry],
   :phone => params[:tphone],
   :email => params[:temail]
 )
 from_address = EasyPost::Address.create(
   :name => params[:fname],
   :street1 => params[:fstreet1],
   :street2 => params[:fstreet2],
   :city => params[:fcity],
   :state => params[:fstate],
   :zip => params[:fzip],
   :phone => params[:fphone],
   :email => params[:femail]
 )

 parcel = EasyPost::Parcel.create(
   :width => params[:width],
   :length => params[:length],
   :height => params[:height],
   :weight => params[:weight]
 )

 customs_item = EasyPost::CustomsItem.create(
   :description => '',
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

 shipment.insure(amount: 100)

 puts shipment.insurance

 redirect_to shipment.postage_label.label_url
  end

end
