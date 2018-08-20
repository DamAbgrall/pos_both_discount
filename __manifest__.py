# -*- coding: utf-8 -*-
{
    'name': 'POS Both Discounts',
    'version': '1.0',
    'category': 'Point Of Sale',
    'sequence': 1,
    'website': '',
	'author': "Noosys",
    'website': "http://btbc.fr/",
    'summary': """Allow you to use amount discount and percentage discount in POS module""",
	'description': """This module allows you to choose for each orderline in the POS which type of discount you want : amount or percentage""",
    'description': """POS Both Discounts""",
    'depends': ['base','point_of_sale'],
    'data': [
        'views/point_of_sale.xml'
    ],
    'demo': [],
    'installable': True,
    'application': False,
	'js': ['static/src/js/config.js'],
    'qweb': ['static/src/xml/pos.xml'],
    'images': [],
	"price":10,
    "currency":"EUR",
}
