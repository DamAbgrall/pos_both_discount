odoo.define('pos_discount_amount.pos.models.amount', function (require) {
"use strict";

var models = require('point_of_sale.models');
var utils = require('web.utils');
// var formats = require('web.formats');
var round_di = utils.round_decimals;
var round_pr = utils.round_precision;
var _super_order = models.Order.prototype;

models.Order = models.Order.extend({
    initialize: function() {
            _super_order.initialize.apply(this,arguments);
        },
    get_total_discount: function() {
            return round_pr(this.orderlines.reduce((function(sum, orderLine) {
				if (orderLine.discount_type == "amount"){
					return sum + (orderLine.get_amount_discount() * orderLine.get_quantity());
				}else{
					return sum + (orderLine.get_unit_price() * (orderLine.get_discount()/100) * orderLine.get_quantity());
				}					
            }), 0), this.pos.currency.rounding); 
    },
});

// Extending order line
var _super_orderline = models.Orderline.prototype;
models.Orderline = models.Orderline.extend({
    initialize: function(attr, options) {
        _super_orderline.initialize.call(this, attr, options);
		$("[data-mode='discount']").click(_.bind(this.getDiscountPopUp,this));
		this.discount_type="false";
		this.amount_discount=0;
    },
	
    
    // changes the base price of the product for this orderline
    set_unit_price: function(price){
        this.order.assert_editable();
        this.price = round_di(parseFloat(price) || 0, this.pos.dp['Product Price']);
        this.trigger('change',this);
    },

     // current pos system is running on % only so, to change the flow to amounting we have to override with this.
    set_discount: function(discount){
        _super_orderline.set_discount.call(this, discount);
        if (this.discount_type == "amount"){
            var disc4amount = Math.max(parseFloat(discount) || 0, 0);
			this.amount_discount = disc4amount;
            this.discount = ((disc4amount/this.price)*100).toFixed(2);
            this.discountStr = '' + this.discount;
            this.trigger('change',this);
        }
    },
	
	get_amount_discount:function(){
		return this.amount_discount;
	},

    /* to calculate each line */
    get_base_price:function(){
        var rounding = this.pos.currency.rounding;
        if (this.discount_type == "amount"){
            return round_pr((this.get_unit_price() * this.get_quantity()) - (this.get_quantity() * this.get_amount_discount()), rounding);
        }
        else{
			return round_pr(this.get_unit_price() * this.get_quantity() * (1 - this.get_discount()/100), rounding);
        }
    },
    
    get_display_price: function(){
        if (this.pos.config.iface_tax_included) {
            return this.get_price_with_tax();
        } else {
            return this.get_base_price();
        }
    },
    
    get_price_without_tax: function(){
        return this.get_all_prices().priceWithoutTax;
    },
    get_price_with_tax: function(){
        return this.get_all_prices().priceWithTax;
    },
    get_tax: function(){
        return this.get_all_prices().tax;
    },
    
    
    /* To display total in all line */
    
    get_all_prices: function(){
        var price_unit;
        if (this.discount_type == "amount"){
			price_unit = this.get_unit_price() - this.get_amount_discount();
        }else{
			price_unit = this.get_unit_price() * (1.0 - (this.get_discount() / 100.0));
		}
        var taxtotal = 0;
        var product =  this.get_product();
        var taxes_ids = product.taxes_id;
        var taxes =  this.pos.taxes;
        var taxdetail = {};
        var product_taxes = [];

        _(taxes_ids).each(function(el){
            product_taxes.push(_.detect(taxes, function(t){
                return t.id === el;
            }));
        });

        var all_taxes = this.compute_all(product_taxes, price_unit, this.get_quantity(), this.pos.currency.rounding);
        _(all_taxes.taxes).each(function(tax) {
            taxtotal += tax.amount;
            taxdetail[tax.id] = tax.amount;
        });

        return {
            "priceWithTax": all_taxes.total_included,
            "priceWithoutTax": all_taxes.total_excluded,
            "tax": taxtotal,
            "taxDetails": taxdetail,
        };
    },
	
    get_discount_type: function(){
        return this.discount_type;
    },
	set_discount_type: function(test){
		if(this.selected== true){
			this.discount_type = test;
		}
        
    },
	
	getDiscountPopUp : function(){
		$("button#per").show();
		$("button#amount").show();
		$(".subwindow-container-fix,.pads").on('click','#per',{thise:this},function(test){
			test.data.thise.set_discount_type("per");
			$("button#per").hide();
			$("button#amount").hide();
		});
		$(".subwindow-container-fix,.pads").on('click','#amount',{thise:this},function(test){
			test.data.thise.set_discount_type("amount");
			$("button#per").hide();
			$("button#amount").hide();
		});
	},
  
});
});

