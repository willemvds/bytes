package main

import (
	"database/sql"
	"fmt"
	"net/http"

	_ "github.com/glebarez/go-sqlite"
)

const KB = 1000 // bytes
const MB = 1000 * KB
const GB = 1000 * MB

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

func upload(resp http.ResponseWriter, req *http.Request) {
	err := req.ParseMultipartForm(5 * MB)
	if err != nil {
		http.Error(resp, err.Error(), http.StatusInternalServerError)
		return
	}

	_, header, err := req.FormFile("file")
	if err != nil {
		http.Error(resp, err.Error(), http.StatusBadRequest)
		return
	}

	fmt.Printf("[upload] filename=%s, size=%d\n", header.Filename, header.Size)
	fmt.Println("[upload] MIME header =", header.Header)

	fmt.Fprintf(resp, "Received %d bytes. Storing it in /dev/null for now.", header.Size)
}

func main() {
	db, err := sql.Open("sqlite", "bytes.db")
	if err != nil {
		fmt.Println("db err = ", err)
		return
	}

	version := ""
	qr := db.QueryRow("select sqlite_version()")
	fmt.Println(qr)
	err = qr.Scan(&version)
	if err != nil {
		fmt.Println("SQLite scan err =", err)
	} else {
		fmt.Println("SQLite version =", version)
	}

	port := 13018
	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.Dir("../../../../frontend/dist")))
	mux.HandleFunc("/bytes.js", bytesJs)
	//mux.HandleFunc("/", index)
	mux.HandleFunc("/styles.css", stylesCss)
	mux.HandleFunc("/upload", upload)
	err = http.ListenAndServe(fmt.Sprintf(":%d", port), mux)
	fmt.Println("ListenAndServe err = ", err)
}
