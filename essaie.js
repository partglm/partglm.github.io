const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const natural = require('natural');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const tokenizer = new natural.WordTokenizer();

const PORT = process.env.PORT || 80;

io.on('connection', (socket) => {
    console.log('Client connecte');

    socket.on('iv', (iv) => {
        const input = iv;
        const cleanInput = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const category = categorizeInsput((cleanInput));
        console.log(`La phrase "${iv}" est categorisee comme: ${category}`);
        socket.emit("ivv", category);
    });
});
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
const insultes = [
    'idiot', 'imbecile', 'cretin', "Conard", "Encule", "Salope","pnj mal code","Il pedale dans la choucroute.",
    "Connard", "Putain", "Idiot", "Bâtard", "Fils de pute", "FDP", "Grosse merde", "Enfoire", "Cretin", "Poufiasse",
    "vil faquin", "Salaud", "Connasse", "Pede", "Tare", "Debile", "Tete de noeud", "desembouteille des alpages", "Naze",
    "Stupide", "Imbecile", "Incompetent", "Nul", "Pathetique", "maraud", "enfoire", "Minable", "Ignorant", "Cretin",
    "Debile", "Pitoyable", "Fatiguant", "foutriquet", "Irritant", "Inutile", "Lamentable", "Miserable", "Abject","grognasse",
    "Detestable", "scelerat", "Repugnant", "Aberrant", "aller chier dans sa caisse", "aller niquer sa mère", "malotru",
    "aller se faire enculer", "aller se faire endauffer", "aller se faire foutre", "aller se faire mettre", "cocu","incapable",
    "allez vous faire foutre", "bite", "chier", "emmerder", "philistin", "fermer sa gueule", "abruti", "andouille", "anglo-fou", 
    "AnnieDingo", "appareilleuse", "Arabe", "assimile", "assimilee", "astèque", "avorton", "bachi-bouzouk", "baleine", "connard",
    "tg", "banded’abrutis", "baraki", "bâtard", "baudet", "beauf", "bellicole", "bete", "paltoquet", "bete à pleurer",
    "bete comme ses pieds", "bete comme un âne", "bete comme un camion", "fecalomes", "bete comme un chou", "bete comme un cochon", 
    "bete comme un cygne", "bete comme une oie", "espèce", "biatch", "bibi", "bic", "bicot", "bicotte", "bique", "bitch", "bitembois",
    "Bitembois", "bloke", "bogmoule", "bolos", "bordille", "boucaque", "boudin", "bouègre", "bouffi", "bouffon", "bouffonne", "bougnoul", 
    "bougnoule", "bougnoulisation", "bougnouliser", "bougre", "bougrede", "boukak", "boulet", "bounioul", "bounioule", "bourdille",
    "bourrer", "bourricot", "bovo", "branleur", "branleuse", "brele", "bride", "bridee", "brigand", "brise-burnes", "bulot", "cacou", 
    "cafre", "cageot", "caldoche", "carcavel", "casse-bonbon", "casse-couille", "casse-couilles", "catin", "cave", "chagasse", 
    "charlotdevogue", "charogne", "chauffard", "chauffeur", "chauffeuse", "chbeb", "chiabrena", "chien de chretien", "chiennasse",
    "chienne", "chiennedechretienne", "chieur", "chieuse", "chinetoc", "chinetoque", "Chinetoque", "chintok", "chleuh", "chnoque",
    "choucroutard", "citrouille", "coche", "cochonne", "colon", "complotiste", "con", "con comme la lune", "con comme ses pieds",
    "con comme un balai", "fumie", "fumier", "con comme un manche", "con comme une chaise", "con comme une valise","glandeur",
    "con comme une valise à poignee interieure", "con comme une valise sans poignee", "conasse", "conchier", "Conchita", "connard",
    "connarde", "connasse", "connaud", "conne", "conspirationniste", "contracibete", "cornichon", "couillemolle", "counifle", "courtaud",
    "courtaude", "CPF", "cretin", "crevure", "cricri", "crotte", "crouïa", "crouillat", "crouille", "dago", "debile","glandu", 
    "debougnouliser", "degouiner", "doryphore", "doxosophe", "doxosophie", "drouille", "duschnoc", "ducon", "duconnot","gogole",
    "dugenoux", "dugland", "duschnock", "emmanche", "emmerder", "emmerdeur", "emmerdeuse", "empafe", "empaffe", "enculée","gogolito",
    "empapaoute", "encule", "encule de ta race", "enculer", "enfant de fusil", "enfant de garce", "enfant de putain", "enfant de pute",
    "enfant de salaud", "enflure", "enfoire", "enfoiree", "en vaselineur", "envoyer faire foutre", "epais", "espèce de", "espingoin",
    "espingouin", "etron", "face de chien", "face de craie", "face de pet", "face de rat", "fachiste", "FART", "FDP", "fell", "feminazie",
    "fermer sa gueule", "feuj", "fils de bâtard", "fils de chien", "fils de chienne", "fils de garce", "merde", "bordel", "putain", "salaud",
    "connard", "enfoire", "encule", "foutre", "idiot", "imbecile", "cretin", "bâtard", "salope", "pede", "poufiasse", "tare", "naze", "con",
    "nazi", "raclure de bidet", "debile","debile","minable","lamentable","pathetique","miserable","ta mère", "ta mere","gogol",
    "abruti","andouille","bouffon","chieur","fils de pute","stupide","ignorant","incompetent","nul","pitoyable","va te faire pendre",
    "irritant","inutile","abject","detestable","repugnant",'merde', 'con', 'putain', 'salaud',"fdp", "debile","cretin", "cretine",
    "aberrant","idiot","idiote","mediocre","faineant", "tu n'est pas la chips la plus croustillante du paquet","enfoire","enfoiree",
    "pas la lumière la plus brillante","pas le couteau le plus aiguise du tiroir", "enfoire", "suceuse de prof","petasse","ferme la",
    "feignant","grossier","arrogant","insolent","malhonnete","Tu n'es pas la lumière la plus brillante de l'arbre de Noël.",
    "Il lui manque une case.","Il n'a pas invente l'eau tiède.","espèce de pute", "encule", "encule", "ta geule","trou du cul",
    "Elle n'a pas toute sa tete.","Tu n'es pas la moitie d'un imbecile.","tu n'est pas le marteau le plus efficace","sale folle",
    "Il est ne fatigue.","Il ne fait pas la queue du chat.", "pute", "sale arabe","sale chien", "espece de robot","je vais te violé",
    "Elle a un grain.","Il a une araignee au plafond.",'stupide', 'nul', 'incompetent',"nègre", "negro","nigga","Nique ta mère",
    "Elle a un pète au casque."," Tu n'es pas la fleur la plus eclatante du bouquet.","batard", "encule","encule","lèche cul",
    "Il est monte à l'envers.","Il a un boulon de moins.","Elle est à côte de ses pompes.","casse couille ","trou duc","fils de ta race",
    ];
    
function categorizeInsput(input) {
    const tokens = tokenizer.tokenize(input.toLowerCase());
        for (let token of tokens) {
            if (insultes.includes(token.toLowerCase())) {
                 return 'Insulte';
            }
        }
   return 'bon';
}
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} on this URL : http://localhost:80`);
});