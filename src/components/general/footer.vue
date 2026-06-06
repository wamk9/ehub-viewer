<template>
    <footer class="w-100">
        <div class="container">
            <div class="row">
                <div class="col-12 col-lg-6 text-center text-lg-start py-3">
                    <h5>{{ $t("modules.footer.about.title") }}</h5>
                    <p>
                        {{ $t("modules.footer.about.content-p1") }}
                    </p>
                    <p>
                        {{ $t("modules.footer.about.content-p2") }}
                    </p>
                    <p>
                        {{ $t("modules.footer.about.content-p3") }}
                    </p>
                </div>
                <div class="col-12 col-lg-3 text-center text-lg-start py-3">
                    <h5>{{ $t("modules.footer.categories.title") }}</h5>
                    <a href="#" class="d-block">Category 1</a>
                    <a href="#" class="d-block">Category 2</a>
                    <a href="#" class="d-block">Category 3</a>
                    <a href="#" class="d-block">Category 4</a>
                    <a href="#" class="d-block">Category 5</a>
                </div>
                <div class="col-12 col-lg-3 text-center text-lg-start py-3">
                    <h5>Contact us</h5>
                    <a href="#" class="d-block">{{ $t("modules.footer.contact.phone") }}</a>
                    <a href="#" class="d-block">{{ $t("modules.footer.contact.email") }}</a>
                    <a href="#" class="d-block">{{ $t("modules.footer.contact.instagram") }}</a>

                </div>
            </div>
            <div class="row w-100">
                <div class="col-12 text-center py-3">
                    <span>{{ $t("modules.footer.rights.content") }}</span>
                </div>
            </div>
        </div>
    </footer>
</template>

<script>
export default {
    props: {
    },
    data() {
        return {
        }
    },
    computed: {
    },
    methods: {
    }
}
</script>

<style>
footer {
    background-color: #303030;
    border-top-color: #0098D8 !important;
    border-top-width: 2px !important;
    border-top-style: solid;
}

footer a {
    color: #fafafa;
    text-decoration: none;
}
</style>
