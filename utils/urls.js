import Is from 'strong-type';

const is = new Is;

const usaEndpoints = {
  sourceUri: "order.dominos.com",
  location: {
    find: "https://api.dominos.com/store-locator-international-service/findAddress?latitude=${lat}&longitude=${lon}"
  },
  store: {
    find: "https://order.dominos.com/power/store-locator?s=${line1}&c=${line2}&type=${pickUpType}",
    info: "https://order.dominos.com/power/store/${storeID}/profile",
    menu: "https://order.dominos.com/power/store/${storeID}/menu?lang=${lang}&structured=true"
  },
  order: {
    validate: "https://order.dominos.com/power/validate-order",
    price: "https://order.dominos.com/power/price-order",
    place: "https://order.dominos.com/power/place-order"
  },
  images: "https://cache.dominos.com/olo/6_47_2/assets/build/market/US/_en/images/img/products/larges/${productCode}.jpg",

  trackRoot: 'https://tracker.dominos.com/tracker-presentation-service/',
  track: "v2/orders",

  //POST {storeId: "8278"}
  token: "https://order.dominos.com/power/paymentGatewayService/braintree/token",

  //POST general upsell see below
  upsell: "https://api.dominos.com/upsell-service/stores/upsellForOrder/",

  //POST specific types of upsell see below
  stepUpsell: "https://api.dominos.com/upsell-service/stores/stepUpsellForOrder"
};

const canadaEndpoints = {
  sourceUri: "order.dominos.ca",
  location: {
    find: "https://api.dominos.com/store-locator-international-service/findAddress?latitude=${lat}&longitude=${lon}"
  },
  store: {
    find: "https://order.dominos.ca/power/store-locator?s=${line1}&c=${line2}&type=${type}",
    info: "https://order.dominos.ca/power/store/${storeID}/profile",
    menu: "https://order.dominos.ca/power/store/${storeID}/menu?lang=${lang}&structured=true"
  },
  order: {
    validate: "https://order.dominos.ca/power/validate-order",
    price: "https://order.dominos.ca/power/price-order",
    place: "https://order.dominos.ca/power/place-order"
  },
  images: "https://cache.dominos.com/nolo/ca/en/6_44_3/assets/build/market/CA/_en/images/img/products/larges/${itemCode}.jpg",

  //canada still uses the old method
  track: "https://order.dominos.ca/orderstorage/GetTrackerData?",

  //Need someone to update these or confirm for canada

  //POST {storeId: "8278"}
  token: "https://order.dominos.com/power/paymentGatewayService/braintree/token",

  //POST general upsell see below
  upsell: "https://api.dominos.com/upsell-service/stores/upsellForOrder/",

  //POST specific types of upsell see below
  stepUpsell: "https://api.dominos.com/upsell-service/stores/stepUpsellForOrder"
}

// (Optional) Use this if your proxy server is on another domain
const PROXY_SERVER = '';

// Create a proxy to transform the URLs
function createRecursiveProxy(target) {
  return new Proxy(target, {
    get: (obj, prop) => {
      const value = obj[prop];

      // Directly return sourceUri and track as they are special cases
      if (prop === 'sourceUri' || prop === 'track') {
        return value;
      }

      if (typeof value === 'string') {
        try {
          const url = new URL(value);
          const tld = url.hostname.split('.').pop();
          const path = url.pathname;
          return `${PROXY_SERVER}/api/dominos-proxy/${tld}${path}`;
        } catch (e) {
          console.warn(e);
          return value;
        }
      }

      if (typeof value === 'object' && value !== null) {
        return createRecursiveProxy(value);
      }

      return value;
    }
  });
}

/* Object proxies

Since API requests cannot be sent directly to dominos.com
from the browser (CORS), we need to proxy requests through
a server.

Instead of building a whole new set of endpoints and having
separate implementations of Dominos on the client and server
side, we're just gonna leave the Dominos package as is, and 
proxy the requests through a server.

To facilitate this, we're going to use a Proxy object to
transform the URLs.
*/
const canada = createRecursiveProxy(canadaEndpoints);
const usa = createRecursiveProxy(usaEndpoints);

let urls = usa;

function useInternational(internationalURLs = usa) {
  is.object(internationalURLs);
  urls = internationalURLs;
}

export {
  urls,
  urls as default,

  usa,
  canada,

  useInternational
}
