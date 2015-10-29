class TrackingController < ApplicationController
  def index
  end
  def create
    ## Creating a Tracker
    
  tracker = EasyPost::Tracker.create({
  tracking_code: "EZ4000000004",
  carrier: "UPS"
})
  end
end
