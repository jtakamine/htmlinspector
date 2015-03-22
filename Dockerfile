FROM golang

# Get source
ADD . /go/src/github.com/jtakamine/htmlinspector

# Set working directory
WORKDIR /go/src/github.com/jtakamine/htmlinspector

# Build application
RUN go build .

# Expose ports
EXPOSE 8000

# Run application
CMD ./htmlinspector 8000