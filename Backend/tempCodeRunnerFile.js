app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(express.static("public"));