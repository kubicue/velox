class HomeController < ApplicationController
  def home
    wf = 'https://api.forecast.io/forecast/8b0e1f8b53a5e7e0e6b2a1b2ced3ceda/32.7150,-117.1625'
    @weather = HTTParty.get(wf).parsed_response
    @city = "Santa Monica, CA"
  end
end
