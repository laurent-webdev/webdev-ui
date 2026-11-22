<?php

namespace App\Controller;

use App\Service\DocPages;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

// Les fichiers lus par les robots : moteurs de recherche (robots.txt, sitemap.xml) et IA (llms.txt, llms-full.txt).
// Calculés depuis doc_sections (config/packages/twig.yaml) et l'adresse du site : une page ajoutée au menu y entre seule
final class SeoController extends AbstractController
{
    // Tout se lit ; l'adresse du sitemap
    #[Route('/robots.txt', name: 'app_robots')]
    public function robots(): Response
    {
        return $this->render('seo/robots.txt.twig', [], new Response(headers: ['Content-Type' => 'text/plain; charset=UTF-8']));
    }

    // L'accueil et les pages du menu
    #[Route('/sitemap.xml', name: 'app_sitemap')]
    public function sitemap(): Response
    {
        return $this->render('seo/sitemap.xml.twig', [], new Response(headers: ['Content-Type' => 'application/xml; charset=UTF-8']));
    }

    // Le sommaire pour les IA (https://llmstxt.org) : ce qu'est le framework, l'essentiel pour l'utiliser, chaque page et sa phrase
    #[Route('/llms.txt', name: 'app_llms')]
    public function llms(DocPages $pages): Response
    {
        return $this->render('seo/llms.txt.twig', ['sections' => $pages->sections()], new Response(headers: ['Content-Type' => 'text/plain; charset=UTF-8']));
    }

    // Toute la doc en un fichier Markdown : l'accueil, puis chaque page du menu
    #[Route('/llms-full.txt', name: 'app_llms_full')]
    public function llmsFull(DocPages $pages): Response
    {
        return $this->render('seo/llms-full.txt.twig', ['home' => $pages->home(), 'sections' => $pages->sections()], new Response(headers: ['Content-Type' => 'text/plain; charset=UTF-8']));
    }
}
