export function convertShopShippingStatus(status) {
	const statusComments = {
		SHIPPING: "ຈັນທະລັກກຳລັງສົ່ງສິນຄ້າຫາລູກຄ້າ",
		FINISHED: "ການສັ່ງຊື້ສຳເລັດ",
		RETURN: "ສິນຄ້າຕີກັບຄືນຫາຈັນທະລັກ",
		REQUEST_TO_SHOP: "ຈັນທະລັກອະນຸມັດ ແລະ ສົ່ງແຈ້ງບອກຮ້ານ",
		APPROVED_FROM_SHOP: "ຮ້ານອະນຸມັດການສັ່ງຊື້",
		REJECTED_FROM_SHOP: "ຮ້ານປະຕິເສດການສັ່ງຊື້",
		SHOP_SHIPPING_TO_CTLH: "ຮ້ານກຳລັງສົ່ງສິນຄ້າຫາຈັນທະລັກ",
		CTLH_RECEIVED: "ຈັນທະລັກໄດ້ຮັບສິນຄ້າຈາກຮ້ານ",
		RETURN_TO_SHOP: "ສິນຄ້າຕີກັບຄືນຫາຮ້ານ",
	};

	return statusComments[status] || "Unknown status";
}
