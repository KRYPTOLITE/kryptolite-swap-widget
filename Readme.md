# The KRYPTOLITE(KRL) Swap Widget For The Web.

The first version of the Kryptolite Swap website widget is now available as a library. This widget allows you to easily add support for buying and selling assets to your own websites. It is powered by our Kryptolite Swap smart contract and allows you earn 0.2% from transactions on your token.

## What are some benefits of using the widget?

You surely don’t want users to leave your website and move on to other platforms or swaps to exchange tokens. That is why Kryptolite Swap offers your users the ability to exchange a wide range of tokens right there on your platform? That way, you ensure that they spend time where you need them to and at the same time gain extra points for user-friendliness, users’ retention time and S.E.O ranking.

Moreover you will not have to rely solely on other platforms but will be able to let users exchange other coins/tokens for your token right there on the spot.

## How to use the widget

A. Import the following JavaScript files to your website.

1. `https://cdn.jsdelivr.net/gh/KRYPTOLITE/kryptolite-swap-widget@main/widget/index.js`
2. `https://cdn.jsdelivr.net/gh/KRYPTOLITE/kryptolite-swap-widget@main/widget/esm.99a00dd4.js`

B. Import the CSS library.

1. `https://cdn.jsdelivr.net/gh/KRYPTOLITE/kryptolite-swap-widget@main/widget/styles.css`

Next, create a div component and with an ID of “kryptolite-swap-widget”, use the data-html element to add your referral wallet address and your base token.

### 1. data-referraladdress

The address entered in the data-referraladdress attribute is used as a referral to the swap. This address is rewarded for each contract swap performed via the widget.

### 2. data-basetoken

The address entered in the data-basetoken attribute is the BEP20 contract address for your projects token/coin. This base token is locked in the pair. This means that you can only use the widget to swap between the base token and any other token. This is done to boost your token activity.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- See -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/KRYPTOLITE/kryptolite-swap-widget@main/widget/styles.css"
    />
    <script
      type="module"
      src="https://cdn.jsdelivr.net/gh/KRYPTOLITE/kryptolite-swap-widget@main/widget/esm.99a00dd4.js"
    ></script>
    <script
      type="module"
      src="https://cdn.jsdelivr.net/gh/KRYPTOLITE/kryptolite-swap-widget@main/widget/index.js"
    ></script>
    <!-- End -->
    <title>A Cool Swap, no code.</title>
  </head>
  <body>
    <div class="sidebar">
      <!-- See -->
      <div
        id="kryptolite-swap-widget"
        data-referraladdress="your_wallet_address"
        data-basetoken="BEP20_contract_address"
      ></div>
      <!-- End -->
    </div>
  </body>
</html>
```

We’ll be adding new features soon.

Enjoy the many benefits of buying and holding Kryptolite (KRL). Don’t forget to purchase KRL as well ;)
