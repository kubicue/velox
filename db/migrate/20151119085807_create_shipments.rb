class CreateShipments < ActiveRecord::Migration
  def change
    create_table :shipments do |t|
      t.string :name
      t.string :street1
      t.string :street2
      t.string :city
      t.string :state
      t.string :zip
      t.string :country
      t.string :phone
      t.float :width
      t.float :length
      t.float :height
      t.float :weight

      t.timestamps null: false
    end
  end
end
