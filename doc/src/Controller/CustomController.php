<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/custom')]
final class CustomController extends AbstractController
{
    #[Route('/breakpoints', name: 'app_breakpoints')]
    public function breakpoints(): Response
    {
        return $this->render('custom/breakpoints.html.twig');
    }

    #[Route('/variables', name: 'app_variables')]
    public function variables(): Response
    {
        return $this->render('custom/variables.html.twig');
    }
}
