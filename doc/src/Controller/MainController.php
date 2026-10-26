<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class MainController extends AbstractController
{
    #[Route('', name: 'app_main')]
    public function index(): Response
    {
        return $this->render('main/index.html.twig');
    }

    // Tous les exemples à tester, sur une seule page
    #[Route('/test', name: 'app_test')]
    public function test(): Response
    {
        return $this->render('test.html.twig');
    }
}
