Vue.component('paginate', VuejsPaginate)

/***************************************************************
 ** Vueインスタンスの生成
 ****************************************************************/

var app = new Vue({
    el: "#app",
    data: {
        // 条件検索設定
        rengeNum: "",
        isCard: false,
        isE_money: false,
        isParking: false,
        isWifi: false,
        freeInput: "",
        url: "result.html?",

        // グーグルマップ設定
        lat: 35.6809591,
        lng: 139.7673068,
        marker: {},

        // グルナビ設定
        range: 2,
        wifi: 0,
        parking: 0,
        e_money: 0,
        card: 0,
        freeword: "",
        keep: {},
        result: "",

        // ページネーション設定
        parPage: 10,
        currentPage: 1,

        scrollY: 0
    },
    watch: {
        // この関数は result が変わるごとに実行される
        result: function() {
            this.result.rest.map((item, index) => {
                //地図中に各店舗のマーカーを作成
                this.marker[index] = new google.maps.Marker({
                    position: new google.maps.LatLng(item.latitude, item.longitude),
                    title: item.name,
                    label: {
                        text: String(index + 1),
                        color: "#fff",
                        fontWeight: 'bold',
                        fontSize: '14px'
                    },
                });

                // マーカーを地図中にセットする
                this.marker[index].setMap(map);

                //キープ機能用変数にfalseを代入する
                this.$set(this.keep, index, false);
            });
        },
    },
    created: function() {
        // 検索パラメータを受け取る処理

        // アドレスの「?」以降を受け取る
        var pram = location.search;

        // 引数がない場合は処理しない
        if (!pram) return "";

        /* 先頭の?,&をカット */
        pram = pram.substring(2);
        console.log(pram);

        // 「&」で引数を分割して配列にする
        var pair = pram.split("&");
        console.log(pair);
        var temp = "";

        for (let i = 0; i < pair.length; i++) {
            // 配列の値を「=」で分割
            temp = pair[i].split("=");
            console.log(pair);

            // パラメータ名、パラメータ値
            let keyName = temp[0];
            let keyValue = temp[1];

            // パラメータ名に応じてdataプロパティに入力
            switch (keyName) {
                case "range":
                    this.range=Number(keyValue);
                    break;
                case "card":
                    this.card=Number(keyValue);
                    break;
                case "e_money":
                    this.e_money=Number(keyValue);
                    break;
                case "parking":
                    this.parking=Number(keyValue);
                    break;
                case "wifi":
                    this.wifi=Number(keyValue);
                    break;
                case "freeword":
                    // デコード
                    var word = decodeURIComponent(keyValue)
                    this.freeword=word;
                    break;
            }

        }


    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll)
    },
    methods: {
        // ページネーションクリック時にcurrentPageを更新
        clickCallback: function(pageNum) {
            this.currentPage = Number(pageNum);
        },

        // スクロールイベント
        scrollTop: function() {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        },
        scrollBottom: function() {
            window.scrollTo({
                top: 700,
                behavior: "smooth"
            });
        },
        handleScroll() {
            this.scrollY = window.scrollY
        },

        // キープ機能
        setKeep: function(event, index) {
            var item_index = index + (this.currentPage - 1) * 10;

            this.$set(this.keep, item_index, !this.keep[item_index]);
            console.log(this.keep[index]);
            event.target.classList.toggle("keep");
            if (this.keep[item_index] === true) {
                // キープしたとき

                // マーカーを変える
                this.marker[item_index].setMap(null);
                this.marker[item_index] = new google.maps.Marker({
                    position: new google.maps.LatLng(this.result.rest[item_index].latitude, this.result.rest[item_index].longitude),
                    title: this.result.rest[item_index].name,
                    icon: {
                        url: "https://lh3.googleusercontent.com/qY0bI-W6usHWmi3Y3N2klUSPnlD0QhFeenfJxtbZisbqeFbKHxW7q5ZZJ5yO3YPWfBA1qdLdqmdts4qVF-gggMUnFEZtuhtXYRMltOvVXFteGvupoc1-wQy0Fi1fwx9qe7U-zx_YDA=s256-p-k",
                        scaledSize: new google.maps.Size(43, 43)
                    }
                });

                // マーカーを地図中にセットする
                this.marker[item_index].setMap(map);
            }
            else {
                // キープを外すとき

                // マーカーを変える
                this.marker[item_index].setMap(null);
                this.marker[item_index] = new google.maps.Marker({
                    position: new google.maps.LatLng(this.result.rest[item_index].latitude, this.result.rest[item_index].longitude),
                    title: this.result.rest[item_index].name,
                    label: {
                        text: String(item_index + 1),
                        color: "#fff",
                        fontWeight: 'bold',
                        fontSize: '14px'
                    },
                });

                // マーカーを地図中にセットする
                this.marker[item_index].setMap(map);
            }
        },

        // 条件検索用URL作成
        getUrl: function() {
            // rengeパラメータをurlに追加
            if (this.rengeNum !== "") this.url += `&range=${this.rengeNum}`;
            // cardパラメータをurlに追加
            if (this.isCard) this.url += "&card=1";
            // e_moneyパラメータをurlに追加
            if (this.isE_money) this.url += "&e_money=1";
            // parkingパラメータをurlに追加
            if (this.isParking) this.url += "&parking=1";
            // Wifiパラメータをurlに追加
            if (this.isWifi) this.url += "&wifi=1";
            // freewordパラメータをurlに追加
            if (this.freeInput !== "") this.url += `&freeword=${this.freeInput}`;

            // URLに遷移
            window.location.href = this.url;
        }
    },
    computed: {
        // 現在ページのアイテムを返す
        getItems: function() {
            if (this.result !== "") { // resultが存在するときのみ実行
                let current = this.currentPage * this.parPage;
                let start = current - this.parPage;
                return this.result.rest.slice(start, current);
            }
        },
        // ページネーションの最大ページ数を求める
        getPageCount: function() {
            if (this.result !== "") // resultが存在するときのみ実行
                return Math.ceil(this.result.rest.length / this.parPage);
        },
    }
})

/***************************************************************
 ** グーグルマップの初期設定+現在地周辺の飲食店データの取得
 ****************************************************************/

function initMap() {
    let lat, lng, i;
    const url = "https://api.gnavi.co.jp/RestSearchAPI/v3/"

    navigator.geolocation.getCurrentPosition((position) => {

        // 緯度経度の取得

        app.lat = position.coords.latitude;
        app.lng = position.coords.longitude;

        // 緯度経度の取得
        latLng = new google.maps.LatLng(app.lat, app.lng);

        // 地図の作成
        map = new google.maps.Map(document.getElementById('map'), {
            center: latLng,
            zoom: 16
        });

        // グルナビのリクエストパラメータを作成
        const params = {
            keyid: "9be00fbaa95f4bcc1b759ab2072385e0",
            latitude: app.lat,
            longitude: app.lng,
            range: app.range,
            card: app.card,
            parking: app.parking,
            e_money: app.e_money,
            wifi: app.wifi,
            freeword: app.freeword,
            hit_per_page: 50
        }


        $.getJSON(url, params, result => {
            app.result = result;
        })

    }, () => {
        //位置情報の取得に失敗したときはalertを表示させたあと
        //東京駅周辺を表示する

        alert('位置情報取得に失敗しました');
        // 緯度経度の取得
        latLng = new google.maps.LatLng(app.lat, app.lng);

        // 地図の作成
        map = new google.maps.Map(document.getElementById('map'), {
            center: latLng,
            zoom: 16
        });

        const params = {
            keyid: "9be00fbaa95f4bcc1b759ab2072385e0",
            latitude: app.lat,
            longitude: app.lng,
            range: app.range,
            card: app.card,
            parking: app.parking,
            e_money: app.e_money,
            wifi: app.wifi,
            freeword: app.freeword,
            hit_per_page: 50
        }


        $.getJSON(url, params, result => {
            app.result = result;
        })
    });
}
