class TracksController < ApplicationController
  before_filter :authorize

  def index
    @track_number = params[:tracking_number]
    @track_me = "https://track.aftership.com/#{@track_number}"
  end

end
