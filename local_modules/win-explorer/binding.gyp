{
    "targets": [{
        "target_name": "win_explorer",
        "cflags!": [ "-fno-exceptions" ],
        "cflags_cc!": [ "-fno-exceptions" ],
        "sources": [
            "src/bindings.cpp"
        ],
        'include_dirs': [
            "<!@(node -p \"require('node-addon-api').include\")"
        ],
        'dependencies': [
            "<!(node -p \"require('node-addon-api').gyp\")"
        ],
        "defines": [
        "NAPI_DISABLE_CPP_EXCEPTIONS" ]
    }]
}