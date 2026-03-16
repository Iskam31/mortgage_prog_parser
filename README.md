# mortgage_prog_parser

HTTP-сервис для автоматического сбора ипотечных программ банков: ставки, названия программ, типы (новостройка, вторичка, рефинансирование), специальные программы (семейная, IT, военная, льготная).

Использует Playwright для рендеринга SPA-страниц и Cheerio для парсинга HTML.

---

## Требования

- Node.js 18+
- npm

---

## Установка

```bash
git clone https://github.com/Iskam31/mortgage_prog_parser.git
cd mortgage_prog_parser
npm install
npx playwright install chromium
```

---

## Запуск

### HTTP-сервис

```bash
npm run serve
# → [INFO] Mortgage parser server running on http://localhost:3000
```

С кастомным портом:
```bash
PORT=3001 npm run serve
```

### CLI

```bash
npm start moscow sberbank.ru:https://www.sberbank.ru/ru/person/credits/home
```

---

## API

### POST /api/parse

Парсит ипотечные программы для списка банков.

**Request:**

```http
POST /api/parse
Content-Type: application/json

{
  "region": "moscow",
  "banks": [
    { "domain": "sberbank.ru", "url": "https://www.sberbank.ru/ru/person/credits/home" },
    { "domain": "vtb.ru", "url": "https://www.vtb.ru/personal/ipoteka/" }
  ]
}
```

**Response:**

```json
{
  "results": [
    {
      "domain": "sberbank.ru",
      "status": "success",
      "programs": [
        {
          "name": "вторичное жильё",
          "type": "secondary",
          "rateMin": 20.1,
          "rateMax": 20.1,
          "isSpecial": false,
          "sourceUrl": "https://www.sberbank.ru/ru/person/credits/home"
        },
        {
          "name": "семейная ипотека",
          "type": "new_building",
          "rateMin": 20.1,
          "rateMax": 20.1,
          "isSpecial": true,
          "specialName": "семейная ипотека",
          "sourceUrl": "https://www.sberbank.ru/ru/person/credits/home"
        }
      ]
    },
    {
      "domain": "vtb.ru",
      "status": "success",
      "programs": [...]
    }
  ]
}
```

| Поле | Тип | Описание |
|------|-----|----------|
| `domain` | string | Домен банка |
| `status` | `"success"` \| `"error"` | Результат парсинга |
| `programs` | array | Массив ипотечных программ |
| `error` | string | Причина ошибки (при status: error) |

### GET /api/health

Проверка доступности сервиса.

```bash
curl http://localhost:3000/api/health
# → {"status":"ok"}
```

---

## Структура ответа программы

```json
{
  "name": "семейная ипотека",
  "type": "new_building",
  "regionCode": "moscow",
  "rateMin": 6.0,
  "rateMax": 20.1,
  "isSpecial": true,
  "specialName": "семейная ипотека",
  "sourceUrl": "https://..."
}
```

| Поле | Тип | Описание |
|------|-----|----------|
| `name` | string | Название программы |
| `type` | string | Тип: `new_building`, `secondary`, `refinancing` |
| `regionCode` | string | Код региона (переданный в запросе) |
| `rateMin` | number | Минимальная ставка % |
| `rateMax` | number | Максимальная ставка % |
| `isSpecial` | boolean | Льготная программа |
| `specialName` | string | Название льготной программы |
| `sourceUrl` | string | URL источника |

---

## Конфигурация

Параметры в `config.ts`:

| Параметр | Значение | Описание |
|----------|---------|----------|
| `concurrency` | 2 | Параллельных запросов |
| `timeout` | 120000 | Таймаут навигации (мс) |
| `waitAfterLoad` | 5000 | Ожидание после загрузки (мс) |

Переменные окружения:

```bash
PORT=3000           # Порт сервера
DEBUG=true          # Сохранять HTML для отладки
```

---

## Поддерживаемые банки

Парсер универсальный и работает с большинством банков:

- Сбер
- ВТБ
- Альфа-Банк
- Дом.РФ
- Газпромбанк (требует доработки)
- Россельхозбанк
- Промсвязьбанк
- Банк Открытие

---

## Поддерживаемые программы

- **Новостройка** / строительство жилья
- **Вторичка** / вторичное жильё / готовое жильё
- **Рефинансирование** / перекредитование
- **Семейная ипотека**
- **IT-ипотека**
- **Военная ипотека**
- **Льготная ипотека** / господдержка
- **Дальневосточная ипотека**

---

## Как это работает

1. Playwright загружает страницу банка (с ожиданием рендеринга SPA)
2. Retry логика при проблемах с загрузкой
3. Cheerio парсит HTML, ищет названия программ и ставки
4. Универсальные регулярки ищут все % в диапазоне 1-30%
5. Программы группируются по названию с min/max ставками

---

## Структура файлов

```
mortgage_prog_parser/
├── server.ts              # HTTP-сервер
├── cli.ts                 # CLI
├── lib.ts                 # Основная логика
├── config.ts              # Конфигурация
├── crawler/
│   ├── browser.ts         # Playwright browser
│   └── pageLoader.ts      # Загрузка страниц
├── extractors/
│   ├── programExtractor.ts # Извлечение программ и ставок
│   └── rateExtractor.ts   # Утилиты для ставок
└── types/
    └── index.ts           # TypeScript интерфейсы
```

---

## Интеграция с фронтендом

```js
const response = await fetch('http://localhost:3000/api/parse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    region: 'moscow',
    banks: [
      { domain: 'sberbank.ru', url: 'https://...' },
      { domain: 'vtb.ru', url: 'https://...' }
    ]
  }),
});

const { results } = await response.json();
```

---

## Лицензия

ISC
