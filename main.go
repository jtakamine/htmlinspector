package main

import (
	"bytes"
	"flag"
	"fmt"
	"net/http"
	"os"
	"strings"
)

func main() {
	fs := http.FileServer(http.Dir(""))
	http.Handle("/", fs)
	http.HandleFunc("/proxy", proxy)

	port := getPort()
	fmt.Println("Listening on port " + port + "...")

	http.ListenAndServe(":"+port, nil)
	fmt.Println("Server exited.")
}

func proxy(rw http.ResponseWriter, req *http.Request) {
	fmt.Println("handling request")
	u := req.URL.Query().Get("url")
	if !strings.HasPrefix(u, "http://") && !strings.HasPrefix(u, "https://") {
		u = "http://" + u
	}

	c := http.Client{}

	r, err := c.Get(u)
	if err != nil {
		panic(err)
	}

	buf := bytes.Buffer{}
	buf.ReadFrom(r.Body)

	rw.Write(buf.Bytes())
}

func getPort() (port string) {
	flag.Parse()
	args := flag.Args()

	if len(args) != 1 {
		showUsage()
	}

	port = args[0]
	return port
}

func showUsage() {
	fmt.Println("\tUsage: htmlinspector <port>")
	os.Exit(1)
}
