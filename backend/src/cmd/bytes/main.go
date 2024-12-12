package main

import (
	"fmt"
	"net/http"
)

const bytesPath = "../../frontend/src/bytes.js"
const indexPath = "../../frontend/src/index.html"
const stylesPath = "../../frontend/src/styles.css"

func bytesJs(resp http.ResponseWriter, req *http.Request) {
	http.ServeFile(resp, req, bytesPath)
}

func index(resp http.ResponseWriter, req *http.Request) {
	http.ServeFile(resp, req, indexPath)
}

func stylesCss(resp http.ResponseWriter, req *http.Request) {
	http.ServeFile(resp, req, stylesPath)
}



func main() {
	port := 13018
	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.Dir("../../../../frontend/dist")))
	mux.HandleFunc("/bytes.js", bytesJs)
	//mux.HandleFunc("/", index)
	mux.HandleFunc("/styles.css", stylesCss)
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), mux)
	fmt.Println("ListenAndServe err = ", err)
}
