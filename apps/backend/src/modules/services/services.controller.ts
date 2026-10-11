import { Body, Controller, Get, MessageEvent, Post, Query, Sse } from '@nestjs/common';
import { GovernmentServicesService } from './government-services.service';
import { ExpertSystemService } from './expert-system.service';
import { SearchServicesDto } from './dto/search-services.dto';
import { Observable, interval, map, startWith } from 'rxjs';

@Controller('api/services')
export class ServicesController {
  constructor(
    private readonly servicesCatalogue: GovernmentServicesService,
    private readonly expertSystem: ExpertSystemService
  ) {}

  @Get('states')
  getStates() {
    return {
      states: this.servicesCatalogue.listStates()
    };
  }

  @Get('categories')
  getCategories() {
    return {
      categories: this.servicesCatalogue.listCategories()
    };
  }

  @Get('state-portals')
  getStatePortals() {
    return {
      portals: this.servicesCatalogue.listStatePortals()
    };
  }

  @Get('summary')
  getCatalogueSummary() {
    return this.servicesCatalogue.getCatalogueSummary();
  }

  @Get('live-snapshot')
  getLiveSnapshot() {
    return this.servicesCatalogue.getLiveSnapshot();
  }

  @Sse('live')
  streamLiveSnapshot(): Observable<MessageEvent> {
    return interval(15000).pipe(
      startWith(0),
      map(() => ({
        type: 'catalogue-live',
        retry: 10000,
        data: this.servicesCatalogue.getLiveSnapshot()
      }))
    );
  }

  @Get('state-catalogue')
  getStateCatalogue(@Query('state') state?: string) {
    return this.servicesCatalogue.listStateCatalogue(state ?? '');
  }

  @Get('category-directory')
  getCategoryDirectory() {
    return {
      categories: this.servicesCatalogue.listCategoryDirectory()
    };
  }

  @Post('search')
  async searchServices(@Body() body: SearchServicesDto) {
    const state = body.state?.trim() ?? '';
    const query = body.query?.trim() ?? '';
    const category = body.category?.trim() ?? '';

    const results = this.servicesCatalogue.search(state || null, query, category || null);
    const expertRecommendations = await this.expertSystem.evaluate(state || null, query);
    const equivalents = this.servicesCatalogue.findEquivalentServices({
      state: state || null,
      query,
      category: category || null,
      existingServiceIds: results.map((service) => service.id),
      limit: results.length > 0 ? 4 : 6
    });

    const recommendations = expertRecommendations
      .map((recommendation) => {
        const service = this.servicesCatalogue.findById(recommendation.serviceId);
        if (!service) {
          return null;
        }

        return {
          service,
          intent: recommendation.intent,
          summary: recommendation.summary,
          explanation: recommendation.explanation,
          confidence: recommendation.confidence,
          matchedSignals: recommendation.matchedSignals
        };
      })
      .filter((recommendation): recommendation is NonNullable<typeof recommendation> => recommendation !== null);

    return {
      query: {
        state,
        text: query,
        category
      },
      counts: {
        results: results.length,
        recommendations: recommendations.length,
        equivalents: equivalents.length
      },
      recommendations,
      equivalents,
      results
    };
  }
}
