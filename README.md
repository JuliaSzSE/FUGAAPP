# FUGAAPP
## Uruchomienie aplikacji lokalnie

Poniższe kroki pozwalają uruchomić aplikację lokalnie.

### Wymagania systemowe

- **Python** w wersji co najmniej **3.10**  
- System operacyjny: **Windows**, **macOS** lub **Linux**  
- Edytor kodu, np. **Visual Studio Code** lub **PyCharm**

---

### Pobranie projektu

1. Należy otworzyć folder, w którym projekt ma zostać zapisany.  
2. Pobrać projekt z repozytorium.  
   W przypadku korzystania z narzędzia Git można użyć polecenia:
git clone https://github.com/JuliaSzSE/FUGAAPP.git

Przejść do folderu projektu:

- cd FUGAAPP
- cd FUGA
## Instalacja zależności
Jeśli w folderze projektu znajduje się plik requirements.txt, należy zainstalować wszystkie wymagane biblioteki za pomocą polecenia:

pip install -r requirements.txt

To polecenie automatycznie pobierze wszystkie niezbędne komponenty.

## Uruchomienie serwera aplikacji
Aby uruchomić aplikację lokalnie, w terminalu należy wpisać:

python manage.py runserver

