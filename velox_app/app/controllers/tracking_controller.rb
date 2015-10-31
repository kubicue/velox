class TrackingController < ApplicationController
  def index
  end
  def create
    ## Creating a Tracker
    # track code:EZ4000000004
    #carrier:"UPS" "USPS"

  tracker = EasyPost::Tracker.create({
  tracking_code: "EZ4000000004",
  carrier: "UPS"
})
  end
end
