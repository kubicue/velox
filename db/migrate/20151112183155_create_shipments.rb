class CreateShipments < ActiveRecord::Migration
  def change
    create_table :shipments do |t|
      t.string :name
      t.string :street1
      t.string :city
      t.string :state
      t.string :zip
      t.string :country
      t.string :email
      t.decimal :lenght
      t.decimal :width
      t.decimal :height
      t.decimal :weight

      t.timestamps null: false
    end
  end
end
