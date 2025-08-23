const { SERVER_URL } = require(".");

module.exports = {
	// SERVER_URL: "https://api.ctlhgroup.com", // production
	SERVER_URL: "http://localhost:8080", // dev
	IMG_PREFIX_S3: "https://store-rich-bucket.s3.ap-southeast-1.amazonaws.com/images/",
	USER: `${SERVER_URL}/v1/api/user`,
	MONEY_USER: `${SERVER_URL}/v1/api/money-user`,
	MONEY_USER_HISTORY: `${SERVER_URL}/v1/api/money-user-history`,
	EXPORT_PRODUCT: `${SERVER_URL}/v1/api/export-product`,
};
