/**
 * Fotos de banco por nicho (Unsplash, licença Unsplash: uso comercial gratuito, sem atribuição obrigatória).
 * Carregadas direto do CDN do Unsplash. Se alguma sair do ar, o site mostra o desenho do nicho no lugar.
 * A primeira de cada lista vai no topo do site e a segunda na seção "sobre".
 */
export type StockPhoto = { id: string; alt: string };

const p = (id: string, alt: string): StockPhoto => ({ id: `photo-${id}`, alt });

export const PHOTOS: Record<string, StockPhoto[]> = {
  plumber: [
    p("1676210134188-4c05dd172f89", "Plumber working on a pipe in a wall"),
    p("1676210133055-eab6ef033ce3", "Plumber fixing a pipe under a sink cabinet"),
    p("1676210134190-3f2c0d5cf58d", "Plumber servicing a water heater"),
    p("1542013936693-884638332954", "Hand opening a kitchen tap"),
    p("1620653713380-7a34b773fef8", "Hand holding a pipe wrench"),
  ],
  electrician: [
    p("1758101755915-462eddc23f57", "Electrician testing an electrical panel with a multimeter"),
    p("1576446468729-7674e99608f5", "Row of circuit breakers"),
    p("1635335874521-7987db781153", "Wires connected in a switch box"),
    p("1761507320645-b11a00bfcc34", "Colourful bundle of electrical wires"),
  ],
  locksmith: [
    p("1609770231080-e321deccc34c", "Key in a door lock"),
    p("1585914641050-fa9883c4e21c", "Padlock on a white door"),
    p("1643804926339-e94f0a655185", "Set of keys on a wooden table"),
    p("1550527882-b71dea5f8089", "Old skeleton keys"),
  ],
  hvac: [
    p("1776860155275-eee24bfb1dee", "Modern house with a heat pump outside"),
    p("1761330440311-16e160cad236", "Living room with an air conditioner"),
    p("1776860150305-108ed577d7d4", "Heat pump unit next to a brick wall"),
    p("1718203862467-c33159fdc504", "Air conditioning unit on a brick wall"),
  ],
  roofer: [
    p("1635424709845-3a85ad5e1f5e", "Roofers working on a house roof"),
    p("1763665814538-8ba04597286c", "Workers installing roof tiles"),
    p("1518736346281-76873166a64a", "Pattern of dark roof tiles"),
    p("1635424824849-1b09bdcc55b1", "Roofer using a power drill on a roof"),
  ],
  painter: [
    p("1688372199140-cade7ae820fe", "Painter painting a wall yellow"),
    p("1525909002-1b05e0c869d8", "Paint rollers in four colours"),
    p("1652829069862-87874e119527", "Paint roller close up"),
    p("1564078516393-cf04bd966897", "Freshly painted room with a chaise by the window"),
  ],
  carpenter: [
    p("1779031242515-205111711b23", "Carpenter working on wood in a workshop"),
    p("1631396326646-c06a935ff3a6", "Carpenter building a chair in a workshop"),
    p("1759523121247-76be6b3490b2", "Hands carving wood with chisels"),
    p("1497218770144-3fea6dbc33fe", "Hand tools on a workbench"),
  ],
  gardener: [
    p("1689728318937-17d24bc0a65c", "Gardener trimming a green lawn"),
    p("1601001815894-4bb6c81416d7", "Vegetable garden in raised wooden beds"),
    p("1759422261399-3370e715b70f", "Hands planting flowers in a garden bed"),
    p("1621272156568-7306716648df", "Garden with a wheelbarrow and flowering bushes"),
  ],
  cleaning: [
    p("1758273705627-937374bfa978", "Vacuuming a bright living room"),
    p("1563453392212-326f5e854473", "Hand holding a cleaning spray bottle"),
    p("1646980241033-cd7abda2ee88", "Cleaner carrying a cleaning caddy and broom"),
    p("1583847268964-b28dc8f51f92", "Clean, bright living room"),
  ],
  movers: [
    p("1758523670991-ee93bc48d81d", "Carrying moving boxes into a new home"),
    p("1783473007464-1dbf2ff30dec", "Moving truck and furniture being carried"),
    p("1758523671071-4e3c43d055e6", "Carrying a large box and a plant"),
    p("1758523671893-0ba21cf4260f", "New home full of moving boxes"),
  ],
  "auto-repair": [
    p("1625047509248-ec889cbff17f", "Mechanic inspecting a car engine"),
    p("1767681092416-bccf9410bda4", "Cars being repaired in a workshop"),
    p("1771340012319-0b4fca008b54", "Mechanic working on an engine"),
    p("1675034743372-672c3c3f8377", "Garage full of tyres"),
  ],
  barber: [
    p("1503951914875-452162b0f3f1", "Man in a barber chair"),
    p("1585747860715-2ba37e788b70", "Leather barber chair by a brick wall"),
    p("1599351431202-1e0f0137899a", "Barber trimming with a straight razor"),
    p("1621605815971-fbc98d665033", "Clippers, scissors and comb on a slate board"),
  ],
  "hair-salon": [
    p("1580618672591-eb180b1a973f", "Hairstylist blow-drying a client's hair"),
    p("1633681926022-84c23e8cb2d6", "Hair salon with black chairs and round mirrors"),
    p("1634449571010-02389ed0f9b0", "Woman getting a haircut"),
    p("1560869713-7d0a29430803", "Hair curler in hand"),
  ],
  beauty: [
    p("1570172619644-dfd03ed5d881", "Facial mask treatment at a spa"),
    p("1632345031435-8727f6897d53", "Manicure at a nail salon"),
    p("1589710751893-f9a6770ad71b", "Eyelash extensions being applied"),
    p("1596462502278-27bfdc403348", "Pink makeup brush set"),
  ],
  "pet-grooming": [
    p("1719464454959-9cf304ef4774", "Small white dog being trimmed with scissors"),
    p("1528846104175-4fd300ee59da", "Groomer brushing a dog"),
    p("1611173622933-91942d394b04", "Pomeranian wrapped in a towel"),
    p("1709777571247-39ad71a2d86e", "Small white dog on a pink background"),
  ],
  physio: [
    p("1649751361457-01d3a696c7e6", "Physiotherapist examining a patient's leg"),
    p("1768507423533-b87b62769758", "Therapist adjusting a patient's neck"),
    p("1519823551278-64ac92734fb1", "Therapeutic back massage"),
    p("1586401100295-7a8096fd231a", "Hands holding light dumbbells"),
  ],
  clinic: [
    p("1631217868264-e5b90bb7e133", "Doctor talking to a patient in a clinic"),
    p("1666214277730-e9c7e755e5a3", "Doctor with a patient in a consultation room"),
    p("1532938911079-1b06ac7ceec7", "Doctor holding a stethoscope"),
    p("1576091160550-2173dba999ef", "Doctor's desk with laptop and stethoscope"),
  ],
  restaurant: [
    p("1766832255363-c9f060ade8b0", "Set tables in a cosy restaurant"),
    p("1600093463592-8e36ae95ef56", "Rustic dining room with plants and pendant lights"),
    p("1533777857889-4be7c70b33f7", "Guest at a restaurant table"),
    p("1538334421852-687c439c92f4", "Wooden tables and chairs in a restaurant"),
  ],
  bakery: [
    p("1568254183919-78a4f43a2877", "Bread on display shelves"),
    p("1555507036-ab1f4038808a", "Two fresh croissants"),
    p("1599819055803-717bba43890f", "Loaf of bread on a paper bag"),
    p("1483695028939-5bb13f8648b0", "Tray of fresh pastries"),
  ],
  cafe: [
    p("1760175445000-0e01e193d1cd", "Cup of coffee with latte art"),
    p("1771344143490-87e02ecc75d2", "Café tables in warm light"),
    p("1770462583587-d311e4ae922c", "Chairs and tables outside a café"),
    p("1766557050127-756f8fcb905c", "Four coffee drinks on a wooden table"),
  ],
  florist: [
    p("1523308458373-c6f61ae1fd21", "Assorted fresh flowers"),
    p("1558879787-4c4aea1fbb83", "Flowers in a white vase"),
    p("1620752379460-d4adfe02a5ce", "Bouquet of pink roses"),
    p("1530488228536-37ae1dbb20a4", "Flower centrepiece in pink and red"),
  ],
};

export const photosFor = (niche: string) => PHOTOS[niche] ?? [];

/** URL redimensionada pelo CDN do Unsplash */
export const photoUrl = (id: string, w = 1600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=72`;
